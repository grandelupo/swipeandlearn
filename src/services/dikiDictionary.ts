import { Definition } from '@/components/Dictionary';

// Helper function to clean up HTML content and handle entities
function cleanDikiText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')   // Fix HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'") // Additional HTML entities commonly found in Diki
    .replace(/&#x2F;/g, '/')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

async function fetchDikiDefinitions(word: string): Promise<Definition[]> {
  try {
    const response = await fetch(`https://www.diki.pl/slownik-angielskiego?q=${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Diki.pl');
    }

    const html = await response.text();
    const definitions: Definition[] = [];
    
    // Find dictionary entity sections - these contain groups of definitions
    const entitySections = html.match(/<div class="dictionaryEntity"[\s\S]*?class="hws"[\s\S]*?<\/(?:ol|div)>\s*?<\/div>/g);

    console.log('entitySections', entitySections?.length);

    console.log('entity no 3', entitySections?.[3]);

    if (!entitySections || entitySections.length === 0) {
      throw new Error('No definitions found');
    }

    const partsOfSpeechByEntities = entitySections?.map(section => 
      section.split('<div class="partOfSpeechSectionHeader">')
    );

    partsOfSpeechByEntities.forEach(entity => {
      let relatedWord: string | undefined = undefined;
      
      entity.forEach(section => {

        if (section.includes('class="hws"')) {

          const relatedWords = section.match(/<div class="hws">([\s\S]*?)<\/div>/)?.[1].trim();
          const hwMatches = relatedWords?.match(/<span class="hw">([\s\S]*?)<\/span>/g);
          const headwords = hwMatches ? hwMatches.map(match => {
            return cleanDikiText(match);
          }) : [];

          console.log('headwords', headwords.join(', '));
          

          relatedWord = headwords.join(', ');
        }


        // Extract part of speech
        const posMatch = section.match(/<span class="partOfSpeech">(.*?)<\/span>/);
        const partOfSpeech = posMatch ? cleanDikiText(posMatch[1]) : '';

        // Extract meaning sections
        const meaningMatches = section.match(/<li[\s\S]*?<\/li>/g);
        
        if (meaningMatches && meaningMatches.length > 0) {
          const defs: Array<{ text: string; example?: string }> = [];
          const additionalExamples: string[] = [];
          
          meaningMatches.forEach(meaning => {
            // Extract the definition text
            const hwMatches = meaning.match(/<span class="hw">([\s\S]*?)<\/span>/g);
            const headwords = hwMatches ? hwMatches.map(match => {
              return cleanDikiText(match);
            }) : [];
            const headwordsWithCommas = headwords.join(', ');

            // Extract examples with their translations
            const exampleMatches = meaning.match(/<div class="exampleSentence"[\s\S]*?<\/div>/g);
            let firstExample: string | undefined;
            
            if (exampleMatches) {
              exampleMatches.forEach((example, index) => {
                const cleanedExample = cleanDikiText(example);
                if (cleanedExample) {
                  if (index === 0) {
                    firstExample = cleanedExample;
                  } else {
                    additionalExamples.push(cleanedExample);
                  }
                }
              });
            }

            if (headwordsWithCommas.length > 0) {
              defs.push({
                text: headwordsWithCommas,
                example: firstExample
              });
            }
          });
          
          // Only add if we have actual definitions
          if (defs.length > 0 && partOfSpeech !== '') {

            definitions.push({
              partOfSpeech: partOfSpeech || 'unknown',
              definitions: defs,
              examples: additionalExamples.length > 0 ? additionalExamples : undefined,
              relatedWord: relatedWord !== word ? relatedWord : undefined
            });
          }
        }
      });
    });
    
    return definitions.length > 0 ? definitions : [{
      partOfSpeech: 'error',
      definitions: [{ text: 'No definitions found' }],
      examples: undefined
    }];
  } catch (error) {
    console.error('Error fetching Diki definitions:', error);
    return [{
      partOfSpeech: 'error',
      definitions: [{ text: 'Failed to fetch definition from Diki.pl' }],
      examples: undefined
    }];
  }
}

export { fetchDikiDefinitions }; 
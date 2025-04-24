-- Create a function to handle story page creation in a transaction
CREATE OR REPLACE FUNCTION public.create_story_page(
  p_story_id uuid,
  p_content text,
  p_target_words text[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_page_number int;
  v_page record;
  v_story record;
BEGIN
  -- Lock the story record to prevent concurrent updates
  SELECT * INTO v_story
  FROM public.stories
  WHERE id = p_story_id
  FOR UPDATE;

  -- Get the next page number
  SELECT COALESCE(MAX(page_number), 0) + 1 INTO v_next_page_number
  FROM public.story_pages
  WHERE story_id = p_story_id;

  -- Insert the new page
  INSERT INTO public.story_pages (
    story_id,
    page_number,
    content,
    target_words
  )
  VALUES (
    p_story_id,
    v_next_page_number,
    p_content,
    p_target_words
  )
  RETURNING * INTO v_page;

  -- Update the story's total pages
  UPDATE public.stories
  SET total_pages = v_next_page_number
  WHERE id = p_story_id
  RETURNING * INTO v_story;

  -- Return both the page and story data
  RETURN json_build_object(
    'page', row_to_json(v_page),
    'story', row_to_json(v_story)
  );
END;
$$; 
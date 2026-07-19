-- Weekly usage counters for Free-plan quota (ISO week, resets Monday 00:00 UTC)
CREATE OR REPLACE FUNCTION rpc_get_weekly_usage(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start TIMESTAMPTZ := date_trunc('week', now());
  v_flashcards INT;
  v_notes INT;
  v_assistant INT;
BEGIN
  SELECT COUNT(*) INTO v_flashcards
  FROM flashcards f
  JOIN flashcard_sets fs ON fs.id = f.set_id
  JOIN resources r ON r.id = fs.resource_id
  WHERE r.owner_id = p_user_id AND f.created_at >= v_week_start;

  SELECT COUNT(*) INTO v_notes
  FROM notes n
  JOIN resources r ON r.id = n.resource_id
  WHERE r.owner_id = p_user_id AND n.created_at >= v_week_start;

  SELECT COUNT(*) INTO v_assistant
  FROM assistant_messages m
  JOIN assistant_sessions s ON s.id = m.session_id
  WHERE s.user_id = p_user_id AND m.role = 'user' AND m.created_at >= v_week_start;

  RETURN json_build_object(
    'flashcards', v_flashcards,
    'notes', v_notes,
    'assistant_messages', v_assistant,
    'week_start', v_week_start,
    'week_resets_at', v_week_start + INTERVAL '7 days'
  );
END;
$$;

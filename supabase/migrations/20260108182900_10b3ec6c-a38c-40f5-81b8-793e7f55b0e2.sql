-- Add INSERT policy for cards on demo org
CREATE POLICY "Authenticated users can create demo cards"
ON public.cards FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

-- Add UPDATE policy for cards on demo org  
CREATE POLICY "Authenticated users can update demo cards"
ON public.cards FOR UPDATE
TO authenticated
USING (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

-- Add INSERT policy for card_controls on demo org
CREATE POLICY "Authenticated users can create demo card controls"
ON public.card_controls FOR INSERT
TO authenticated
WITH CHECK (
  card_id IN (
    SELECT id FROM cards 
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'
  )
);

-- Add UPDATE policy for card_controls on demo org
CREATE POLICY "Authenticated users can update demo card controls"
ON public.card_controls FOR UPDATE
TO authenticated
USING (
  card_id IN (
    SELECT id FROM cards 
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'
  )
);
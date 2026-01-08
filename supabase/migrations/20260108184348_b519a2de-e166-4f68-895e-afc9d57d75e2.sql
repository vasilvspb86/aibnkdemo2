-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts bucket
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can delete their receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');

-- Add INSERT policy for expenses on demo org
CREATE POLICY "Authenticated users can create demo expenses"
ON public.expenses FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

-- Add SELECT policy for expenses on demo org
CREATE POLICY "Authenticated users can view demo expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

-- Add UPDATE policy for expenses on demo org
CREATE POLICY "Authenticated users can update demo expenses"
ON public.expenses FOR UPDATE
TO authenticated
USING (
  organization_id = '11111111-1111-1111-1111-111111111111'
);
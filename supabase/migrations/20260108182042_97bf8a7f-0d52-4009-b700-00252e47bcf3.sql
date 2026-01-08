-- Drop existing restrictive policies on payment_links
DROP POLICY IF EXISTS "Users can manage their payment_links" ON public.payment_links;

-- Create INSERT policy for demo org
CREATE POLICY "Users can create payment links for demo org"
ON public.payment_links FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

-- Create SELECT/UPDATE/DELETE policy
CREATE POLICY "Users can view payment links for demo org"
ON public.payment_links FOR SELECT
TO authenticated
USING (
  organization_id = '11111111-1111-1111-1111-111111111111'
);

CREATE POLICY "Users can update payment links for demo org"
ON public.payment_links FOR UPDATE
TO authenticated
USING (
  organization_id = '11111111-1111-1111-1111-111111111111'
);
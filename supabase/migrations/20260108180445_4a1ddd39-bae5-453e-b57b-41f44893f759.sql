-- Add INSERT policies for payments and payment_links for demo org
CREATE POLICY "Authenticated users can create demo payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (organization_id = '11111111-1111-1111-1111-111111111111');

CREATE POLICY "Authenticated users can create demo payment links"
ON public.payment_links FOR INSERT
TO authenticated
WITH CHECK (organization_id = '11111111-1111-1111-1111-111111111111');

CREATE POLICY "Authenticated users can create demo beneficiaries"
ON public.beneficiaries FOR INSERT
TO authenticated
WITH CHECK (organization_id = '11111111-1111-1111-1111-111111111111');
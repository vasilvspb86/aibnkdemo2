-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Authenticated users can create demo payments" ON public.payments;
DROP POLICY IF EXISTS "Users can manage their payments" ON public.payments;

-- Create a more permissive INSERT policy for demo payments
CREATE POLICY "Users can create payments for demo org"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = '11111111-1111-1111-1111-111111111111'
  AND created_by = auth.uid()
);

-- Recreate the general management policy for SELECT/UPDATE/DELETE
CREATE POLICY "Users can manage their payments"
ON public.payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id AND owner_id = auth.uid()
  )
  OR organization_id = '11111111-1111-1111-1111-111111111111'
);
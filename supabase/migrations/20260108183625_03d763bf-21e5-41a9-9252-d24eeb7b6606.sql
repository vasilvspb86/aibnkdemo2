-- Add INSERT policy for transactions on demo account
CREATE POLICY "Authenticated users can create demo transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (
  account_id = '22222222-2222-2222-2222-222222222222'
);
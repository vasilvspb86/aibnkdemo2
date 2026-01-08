-- Add temporary public read access for demo data viewing
-- These would be removed in production and replaced with proper user-linked data

-- Allow authenticated users to view demo organization
CREATE POLICY "Authenticated users can view demo org"
ON public.organizations FOR SELECT
TO authenticated
USING (id = '11111111-1111-1111-1111-111111111111');

-- Allow authenticated users to view demo account
CREATE POLICY "Authenticated users can view demo account"
ON public.accounts FOR SELECT
TO authenticated
USING (organization_id = '11111111-1111-1111-1111-111111111111');

-- Allow authenticated users to view demo transactions
CREATE POLICY "Authenticated users can view demo transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (account_id = '22222222-2222-2222-2222-222222222222');

-- Allow authenticated users to view demo invoices
CREATE POLICY "Authenticated users can view demo invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (organization_id = '11111111-1111-1111-1111-111111111111');

-- Allow authenticated users to view demo beneficiaries
CREATE POLICY "Authenticated users can view demo beneficiaries"
ON public.beneficiaries FOR SELECT
TO authenticated
USING (organization_id = '11111111-1111-1111-1111-111111111111');

-- Allow authenticated users to view demo cards
CREATE POLICY "Authenticated users can view demo cards"
ON public.cards FOR SELECT
TO authenticated
USING (organization_id = '11111111-1111-1111-1111-111111111111');

-- Allow authenticated users to view demo card transactions
CREATE POLICY "Authenticated users can view demo card transactions"
ON public.card_transactions FOR SELECT
TO authenticated
USING (
  card_id IN (
    SELECT id FROM public.cards 
    WHERE organization_id = '11111111-1111-1111-1111-111111111111'
  )
);

-- Allow authenticated users to view demo credit prequalification
CREATE POLICY "Authenticated users can view demo credit prequal"
ON public.credit_prequalifications FOR SELECT
TO authenticated
USING (organization_id = '11111111-1111-1111-1111-111111111111');
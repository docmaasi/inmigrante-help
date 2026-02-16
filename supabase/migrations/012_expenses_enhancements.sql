-- Migration 012: Add status and submitter tracking to expenses table
-- Enables expense reconciliation (pending/approved/reimbursed) and
-- tracks who submitted each expense for audit purposes.

-- Reconciliation status: pending (default), approved, reimbursed
ALTER TABLE public.expenses
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Who submitted the expense (references the profile)
ALTER TABLE public.expenses
    ADD COLUMN submitted_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Cached display name so it shows even if the profile is deleted
ALTER TABLE public.expenses
    ADD COLUMN submitted_by_name TEXT;

-- Index for filtering by status
CREATE INDEX idx_expenses_status ON public.expenses(status);

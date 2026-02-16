-- Rename old receipt statuses to new ones:
-- pending/approved → paid (these are payments that already happened)
-- reimbursed → complete (payment process is finished)

-- 1. Rename existing rows
UPDATE public.expenses SET status = 'paid'
  WHERE status IN ('pending', 'approved');

UPDATE public.expenses SET status = 'complete'
  WHERE status = 'reimbursed';

-- 2. Change the column default from 'pending' to 'paid'
--    so any new expense created without an explicit status
--    gets the correct default value
ALTER TABLE public.expenses
  ALTER COLUMN status SET DEFAULT 'paid';

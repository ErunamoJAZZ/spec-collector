import { Router, Response } from 'express';
import { supabase } from '../supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { data: spec, error } = await supabase
      .from('specs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      res.status(500).json({ error: 'Failed to fetch spec' });
      return;
    }

    if (!spec) {
      // Return empty spec structure instead of 404
      res.json({ project_name: '', spec_content: '', execution_plan: '' });
      return;
    }

    res.json(spec);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { project_name, spec_content, execution_plan } = req.body;

  try {
    const { data, error } = await supabase
      .from('specs')
      .upsert({
        user_id: userId,
        project_name,
        spec_content,
        execution_plan
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update spec' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

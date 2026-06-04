import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, pin } = req.body;

  if (!email || !pin || !/^\d{4}$/.test(pin)) {
    res.status(400).json({ error: 'Valid email and 4-digit pin are required' });
    return;
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let userId: string;

    if (!user || fetchError) {
      // User doesn't exist, create one
      const pinHash = await bcrypt.hash(pin, 10);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ email, pin_hash: pinHash }])
        .select()
        .single();
        
      if (createError || !newUser) {
        console.error(createError);
        res.status(500).json({ error: 'Failed to create user' });
        return;
      }
      
      userId = newUser.id;
    } else {
      // User exists, verify pin
      const isValid = await bcrypt.compare(pin, user.pin_hash);
      
      if (!isValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      userId = user.id;
    }

    // Log the action
    await supabase.from('audit_logs').insert([{ user_id: userId, action: 'LOGIN' }]);

    // Generate JWT
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: { id: userId, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

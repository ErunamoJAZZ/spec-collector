import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin || !/^\d{4}$/.test(pin)) {
      res.status(400).json({ error: 'Valid email and 4-digit pin are required' });
      return;
    }

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
    next(error);
  }
});

router.put('/change-pin', authenticate, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { oldPin, newPin } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!oldPin || !newPin || !/^\d{4}$/.test(oldPin) || !/^\d{4}$/.test(newPin)) {
      res.status(400).json({ error: 'Both old and new 4-digit pins are required' });
      return;
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('pin_hash')
      .eq('id', userId)
      .single();

    if (!user || fetchError) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(oldPin, user.pin_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid old pin' });
      return;
    }

    const newPinHash = await bcrypt.hash(newPin, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ pin_hash: newPinHash })
      .eq('id', userId);

    if (updateError) {
      console.error(updateError);
      res.status(500).json({ error: 'Failed to update pin' });
      return;
    }

    // Log the action
    await supabase.from('audit_logs').insert([{ user_id: userId, action: 'CHANGE_PIN' }]);

    res.json({ message: 'Pin changed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

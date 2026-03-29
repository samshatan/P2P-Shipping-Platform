import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import pool from '../../../Database/db';
import { successResponse, errorResponse } from '../../shared/types';

// ── POST /users/addresses ────────────────────
export const createAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const { label, full_address, name, phone, pincode, city, state, landmark, is_default } = req.body;

  if (!full_address || !name || !phone || !pincode || !city || !state) {
    res.status(400).json(errorResponse('VALIDATION_001', 'full_address, name, phone, pincode, city, and state are required'));
    return;
  }

  if (!/^\d{6}$/.test(pincode)) {
    res.status(400).json(errorResponse('VALIDATION_002', 'Pincode must be 6 digits'));
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    res.status(400).json(errorResponse('VALIDATION_002', 'Phone must be 10 digits'));
    return;
  }

  try {
    // If this address is default, unset all others first
    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }

    const result = await pool.query(
      `INSERT INTO addresses (user_id, label, name, phone, pincode, city, state, area, flat, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, label, area AS full_address, pincode, city, state, is_default, created_at`,
      [
        userId,
        label || 'other',
        name,
        phone,
        pincode,
        city,
        state,
        full_address,            // stored in `area` column
        landmark || null,
        is_default === true,
      ]
    );

    const addr = result.rows[0];

    res.status(201).json(
      successResponse({
        address_id: addr.id,
        label: addr.label,
        full_address: addr.full_address,
        pincode: addr.pincode,
        city: addr.city,
        state: addr.state,
        is_default: addr.is_default,
        created_at: addr.created_at,
      })
    );
  } catch (err) {
    console.error('❌ createAddress failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not save address'));
  }
};

// ── GET /users/addresses ─────────────────────
export const listAddresses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  try {
    const result = await pool.query(
      `SELECT id, label, name, phone, area AS full_address, pincode, city, state, flat AS landmark, is_default, created_at
       FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.status(200).json(
      successResponse({
        addresses: result.rows.map((a) => ({
          address_id: a.id,
          label: a.label,
          name: a.name,
          phone: a.phone,
          full_address: a.full_address,
          pincode: a.pincode,
          city: a.city,
          state: a.state,
          landmark: a.landmark,
          is_default: a.is_default,
          created_at: a.created_at,
        })),
        total: result.rows.length,
      })
    );
  } catch (err) {
    console.error('❌ listAddresses failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not fetch addresses'));
  }
};

// ── PUT /users/addresses/:address_id ─────────
export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { address_id } = req.params;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  const { label, full_address, name, phone, pincode, city, state, landmark, is_default } = req.body;

  try {
    // Ensure address belongs to user
    const owner = await pool.query(
      'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
      [address_id, userId]
    );
    if (owner.rows.length === 0) {
      res.status(404).json(errorResponse('ADDRESS_002', 'Address not found'));
      return;
    }

    // If setting as default, unset others
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (label !== undefined)      { setClauses.push(`label = $${idx++}`);    values.push(label); }
    if (full_address !== undefined){ setClauses.push(`area = $${idx++}`);    values.push(full_address); }
    if (name !== undefined)        { setClauses.push(`name = $${idx++}`);    values.push(name); }
    if (phone !== undefined)       { setClauses.push(`phone = $${idx++}`);   values.push(phone); }
    if (pincode !== undefined)     { setClauses.push(`pincode = $${idx++}`); values.push(pincode); }
    if (city !== undefined)        { setClauses.push(`city = $${idx++}`);    values.push(city); }
    if (state !== undefined)       { setClauses.push(`state = $${idx++}`);   values.push(state); }
    if (landmark !== undefined)    { setClauses.push(`flat = $${idx++}`);    values.push(landmark); }
    if (is_default !== undefined)  { setClauses.push(`is_default = $${idx++}`); values.push(is_default); }

    if (setClauses.length === 0) {
      res.status(400).json(errorResponse('VALIDATION_001', 'No fields to update'));
      return;
    }

    values.push(address_id);

    const result = await pool.query(
      `UPDATE addresses SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING id, created_at`,
      values
    );

    res.status(200).json(
      successResponse({
        address_id: result.rows[0].id,
        updated_at: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error('❌ updateAddress failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not update address'));
  }
};

// ── DELETE /users/addresses/:address_id ──────
export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { address_id } = req.params;
  if (!userId) { res.status(401).json(errorResponse('UNAUTHORIZED', 'Not authenticated')); return; }

  try {
    const addr = await pool.query(
      'SELECT id, is_default FROM addresses WHERE id = $1 AND user_id = $2',
      [address_id, userId]
    );

    if (addr.rows.length === 0) {
      res.status(404).json(errorResponse('ADDRESS_002', 'Address not found'));
      return;
    }

    if (addr.rows[0].is_default) {
      res.status(400).json(errorResponse('ADDRESS_003', 'Cannot delete default address — set another as default first'));
      return;
    }

    await pool.query('DELETE FROM addresses WHERE id = $1', [address_id]);

    res.status(200).json(successResponse({ message: 'Address deleted successfully' }));
  } catch (err) {
    console.error('❌ deleteAddress failed:', err);
    res.status(500).json(errorResponse('SERVER_001', 'Could not delete address'));
  }
};

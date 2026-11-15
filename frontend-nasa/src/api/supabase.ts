import { createClient } from '@supabase/supabase-js';
import type { FieldProfile, Strategy } from '../types/domain';
import { MOCK_FIELDS, MOCK_STRATEGIES } from './mock/mockData';

// Supabase Project ljxtsjmlqzuebngrfdyd
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ljxtsjmlqzuebngrfdyd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create client (with dummy key fallback if user hasn't added anon key to .env.local yet)
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-anon-key-placeholder');

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey !== 'dummy-anon-key-placeholder');

/**
 * Fetch list of agricultural fields from Supabase (table: `fields`)
 * Seamlessly falls back to calibrated NASA mock data if table is empty or offline
 */
export async function getFieldsFromDatabase(): Promise<FieldProfile[]> {
  if (!isSupabaseConfigured) {
    return MOCK_FIELDS;
  }

  try {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      console.warn('Supabase fields query empty or failed, using NASA field baseline:', error?.message);
      return MOCK_FIELDS;
    }

    return data as FieldProfile[];
  } catch (err) {
    console.warn('Failed connecting to Supabase fields table:', err);
    return MOCK_FIELDS;
  }
}

/**
 * Fetch rotation strategies for a field from Supabase (table: `strategies`)
 * Falls back to calibrated risk-aware strategies
 */
export async function getStrategiesFromDatabase(fieldId: string): Promise<Strategy[]> {
  if (!isSupabaseConfigured) {
    return MOCK_STRATEGIES[fieldId] || MOCK_STRATEGIES['banyumas-karangrau-01'];
  }

  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('field_id', fieldId);

    if (error || !data || data.length === 0) {
      console.warn('Supabase strategies query empty or failed, using baseline strategies:', error?.message);
      return MOCK_STRATEGIES[fieldId] || MOCK_STRATEGIES['banyumas-karangrau-01'];
    }

    return data as Strategy[];
  } catch (err) {
    console.warn('Failed connecting to Supabase strategies table:', err);
    return MOCK_STRATEGIES[fieldId] || MOCK_STRATEGIES['banyumas-karangrau-01'];
  }
}

import { createClient } from '@supabase/supabase-js';
import * as Device from 'expo-device';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    const deviceId = Device.osInternalBuildId || Device.deviceName || 'unknown';

    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          token,
          device_id: deviceId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'device_id',
        }
      );

    if (error) {
      console.error('Error saving push token:', error);
      throw error;
    }

    console.log('Push token saved successfully');
  } catch (error) {
    console.error('Failed to save push token:', error);
    throw error;
  }
}

export async function removePushToken(deviceId?: string): Promise<void> {
  try {
    const id = deviceId || Device.osInternalBuildId || Device.deviceName || 'unknown';

    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('device_id', id);

    if (error) {
      console.error('Error removing push token:', error);
      throw error;
    }

    console.log('Push token removed successfully');
  } catch (error) {
    console.error('Failed to remove push token:', error);
  }
}

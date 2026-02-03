import cron from 'node-cron';
import { runExpiryCheck } from './package.service';

/**
 * Initialize all system cron jobs
 */
export const initCronJobs = () => {
    console.log('Initializing cron jobs...');

    // Run expiry check every day at midnight (00:00)
    // 0 0 * * *
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily expiry check...');
        try {
            const result = await runExpiryCheck('SYSTEM_CRON', 'SUPER_ADMIN' as any);
            console.log('[CRON] Expiry check completed:', result);
        } catch (error) {
            console.error('[CRON] Expiry check failed:', error);
        }
    });

    console.log('Cron jobs scheduled:');
    console.log('- Daily Expiry Check (00:00)');
};

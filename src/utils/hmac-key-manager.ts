    import crypto from 'crypto';

    // Interfaces for key management
    interface KeyPair {
    active: string;
    previous: string[];
    timestamp: number;
    }

    /**
     * HMAC Key Manager for Rapyd SDK
     * This implementation manages key generation, rotation and secure access
     * without exposing keys in the SDK package
     */
    export class HmacKeyManager {
    private static instance: HmacKeyManager;
    private memoryKeyCache: Map<string, KeyPair> = new Map();
    
    // Custom storage handler function type
    private storageHandler?: (operation: 'get' | 'set', customerId: string, data?: KeyPair) => Promise<KeyPair | null>;

    // Make constructor private for singleton pattern
    private constructor() {}

    /**
     * Get singleton instance of HmacKeyManager
     */
    public static getInstance(): HmacKeyManager {
        if (!HmacKeyManager.instance) {
        HmacKeyManager.instance = new HmacKeyManager();
        }
        return HmacKeyManager.instance;
    }

    /**
     * Configure custom storage handler (optional)
     * @param handler Function to handle storage operations
     */
    public setStorageHandler(
        handler: (operation: 'get' | 'set', customerId: string, data?: KeyPair) => Promise<KeyPair | null>
    ): void {
        this.storageHandler = handler;
    }

    /**
     * Generate a new HMAC key with specified length
     * @param length Length of the key in bytes (default: 32)
     * @returns Hex-encoded string representation of the key
     */
    public generateHmacKey(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Get the active HMAC key for a customer
     * @param customerId Unique identifier for the customer (e.g., accessKey)
     * @returns Active HMAC key
     */
    public async getActiveHmacKey(customerId: string): Promise<string> {
        const keyPair = await this.getOrCreateKeyPair(customerId);
        return keyPair.active;
    }

    /**
 * Delete key pair if it is expired beyond a certain threshold
 * @param customerId Unique identifier for the customer
 * @param expiryDays Number of days before key pair is deleted (default: 365)
 */
public async deleteKeyPairIfExpired(customerId: string, expiryDays: number = 90): Promise<boolean> {
    const keyPair = await this.getOrCreateKeyPair(customerId);
    const now = Date.now();
    const expiryTime = expiryDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    if (now - keyPair.timestamp >= expiryTime) {
        // Remove from memory cache
        this.memoryKeyCache.delete(customerId);

        // Remove from custom storage if applicable
        if (this.storageHandler) {
            try {
                await this.storageHandler('set', customerId);
            } catch (error) {
                console.warn(`Failed to delete key pair from storage for ${customerId}:`, error);
                return false;
            }
        }
        return true;
    }

    return false;
}

    /**
     * Rotate HMAC key for a customer
     * @param customerId Unique identifier for the customer
     * @param newKey Optional new key (generated if not provided)
     * @returns New active key
     */
    public async rotateHmacKey(customerId: string, newKey?: string): Promise<string> {
        const keyPair = await this.getOrCreateKeyPair(customerId);
        
        // Move current active key to previous keys
        keyPair.previous.unshift(keyPair.active);
        
        // Limit previous keys to 5
        if (keyPair.previous.length > 5) {
        keyPair.previous = keyPair.previous.slice(0, 5);
        }
        
        // Set new active key
        keyPair.active = newKey || this.generateHmacKey();
        keyPair.timestamp = Date.now();
        
        // Save updated key pair
        await this.saveKeyPair(customerId, keyPair);
        
        return keyPair.active;
    }

  /**
 * Check if key rotation is due and rotate if necessary.
 * If expired beyond a threshold, delete the key pair.
 * @param customerId Unique identifier for the customer
 * @param rotationDays Days after which rotation is due (default: 90)
 * @param expiryDays Days after which key pair should be deleted (default: 365)
 * @returns Whether rotation was performed or key was deleted
 */
public async checkAndRotateIfDue(customerId: string, rotationDays: number = 90, expiryDays: number = 365): Promise<boolean> {
    // First, check if key should be deleted
    const isDeleted = await this.deleteKeyPairIfExpired(customerId, expiryDays);
    if (isDeleted) return false; // Key pair deleted, no rotation needed

    // Check for rotation
    const keyPair = await this.getOrCreateKeyPair(customerId);
    const now = Date.now();
    const rotationDueTime = rotationDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    if (now - keyPair.timestamp >= rotationDueTime) {
        await this.rotateHmacKey(customerId);
        return true;
    }

    return false;
}

    /**
     * Verify signature using any valid key (active or previous)
     * @param customerId Unique identifier for the customer
     * @param data Data that was signed
     * @param signature Signature to verify
     * @returns Whether signature is valid
     */
    public async verifySignature(
        customerId: string, 
        data: string, 
        signature: string
    ): Promise<boolean> {
        const keyPair = await this.getOrCreateKeyPair(customerId);
        
        // Try with active key
        const activeSignature = crypto.createHmac('sha256', keyPair.active).update(data).digest('hex');
        try {
        if (crypto.timingSafeEqual(Buffer.from(activeSignature, 'hex'), Buffer.from(signature, 'hex'))) {
            return true;
        }
        } catch (error) {
        // Signature comparison failed - continue to try previous keys
        }
        
        // Try with previous keys
        for (const prevKey of keyPair.previous) {
        const prevSignature = crypto.createHmac('sha256', prevKey).update(data).digest('hex');
        try {
            if (crypto.timingSafeEqual(Buffer.from(prevSignature, 'hex'), Buffer.from(signature, 'hex'))) {
            return true;
            }
        } catch (error) {
            continue; // Skip if comparison fails (e.g., different lengths)
        }
        }
        
        return false;
    }

    // PRIVATE METHODS

    /**
     * Get existing key pair or create a new one
     * @param customerId Unique identifier for the customer
     * @returns Key pair for the customer
     */
    private async getOrCreateKeyPair(customerId: string): Promise<KeyPair> {
        // Try to get from memory cache first
        const cachedKeyPair = this.memoryKeyCache.get(customerId);
        if (cachedKeyPair) {
        return cachedKeyPair;
        }
        
        // Try to get from custom storage handler if configured
        if (this.storageHandler) {
        try {
            const keyPair = await this.storageHandler('get', customerId);
            if (keyPair) {
            this.memoryKeyCache.set(customerId, keyPair);
            return keyPair;
            }
        } catch (error) {
            console.warn(`Failed to get key pair from storage for ${customerId}:`, error);
        }
        }
        
        // Create new key pair if not found
        const newKeyPair: KeyPair = {
        active: this.generateHmacKey(),
        previous: [],
        timestamp: Date.now()
        };
        
        // Save new key pair
        await this.saveKeyPair(customerId, newKeyPair);
        
        return newKeyPair;
    }

    /**
     * Save key pair to storage
     * @param customerId Unique identifier for the customer
     * @param keyPair Key pair to save
     */
    private async saveKeyPair(customerId: string, keyPair: KeyPair): Promise<void> {
        // Update memory cache
        this.memoryKeyCache.set(customerId, keyPair);
        
        // Save to custom storage if configured
        if (this.storageHandler) {
        try {
            await this.storageHandler('set', customerId, keyPair);
        } catch (error) {
            console.warn(`Failed to save key pair to storage for ${customerId}:`, error);
        }
        }
    }

    private encryptKey(key: string, secret: string): string {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), Buffer.alloc(16, 0));
        return Buffer.concat([cipher.update(key, 'utf8'), cipher.final()]).toString('hex');
    }
    
    private decryptKey(encryptedKey: string, secret: string): string {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), Buffer.alloc(16, 0));
        return Buffer.concat([decipher.update(Buffer.from(encryptedKey, 'hex')), decipher.final()]).toString('utf8');
    }

    

    }

    // Export singleton functions for backward compatibility
    export function generateHmacKey(length: number = 32): string {
    return HmacKeyManager.getInstance().generateHmacKey(length);
    }

    export async function getActiveHmacKey(customerId: string ): Promise<string> {
    return HmacKeyManager.getInstance().getActiveHmacKey(customerId);
    }

    export async function rotateHmacKey(customerId: string = 'default', newKey?: string): Promise<string> {
    return HmacKeyManager.getInstance().rotateHmacKey(customerId, newKey);
    }
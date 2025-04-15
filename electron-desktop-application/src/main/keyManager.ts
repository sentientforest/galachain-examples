import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { RegisterEthUserDto , UserAlias } from '@gala-chain/api';
import { ChainUser } from './ChainUser';

// export interface ChainUser {
//   prefix: string;
//   name: string;
//   identityKey: UserAlias;
//   ethAddress: string;
//   privateKey: string;
//   publicKey: string;
// }

export class KeyManager {
  private userDataPath: string;
  private keyFilePath: string;

  constructor() {
    this.userDataPath = app.getPath('userData');
    this.keyFilePath = path.join(this.userDataPath, 'user-keys.json');
  }

  /**
   * Generate new user keys and store them securely
   */
  async generateNewKeys(): Promise<{ publicKey: string; privateKey: string }> {
    const newUser = ChainUser.withRandomKeys();
    
    // Store keys securely in the user data directory
    // todo: look into OS Keychain support
    const keyData = {
      publicKey: newUser.publicKey,
      privateKey: newUser.privateKey,
      createdAt: new Date().toISOString()
    };

    await this.saveKeys(keyData);
    return {
      publicKey: newUser.publicKey,
      privateKey: newUser.privateKey
    };
  }

  /**
   * Save keys to the secure storage location
   */
  private async saveKeys(keyData: any): Promise<void> {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.keyFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the key file
      fs.writeFileSync(this.keyFilePath, JSON.stringify(keyData, null, 2), {
        mode: 0o600, // Read/write for owner only
      });
    } catch (error) {
      console.error('Error saving keys:', error);
      throw error;
    }
  }

  /**
   * Load existing keys from storage
   */
  async loadKeys(): Promise<{ publicKey: string; privateKey: string } | null> {
    try {
      if (!fs.existsSync(this.keyFilePath)) {
        return null;
      }

      const data = fs.readFileSync(this.keyFilePath, 'utf8');
      const keyData = JSON.parse(data);
      return {
        publicKey: keyData.publicKey,
        privateKey: keyData.privateKey
      };
    } catch (error) {
      console.error('Error loading keys:', error);
      return null;
    }
  }

  /**
   * Register user with the Gala Chain
   */
  async registerUser(apiUrl: string, adminPrivateKey: string): Promise<any> {
    const keys = await this.loadKeys();
    if (!keys) {
      throw new Error('No keys found. Generate keys first.');
    }

    const dto = new RegisterEthUserDto();
    dto.publicKey = keys.publicKey;
    dto.uniqueKey = `${keys.publicKey}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    dto.sign(adminPrivateKey, false);

    const url = `${apiUrl}/PublicKeyContract/RegisterEthUser`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: dto.serialize()
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete existing keys
   */
  async deleteKeys(): Promise<void> {
    try {
      if (fs.existsSync(this.keyFilePath)) {
        fs.unlinkSync(this.keyFilePath);
      }
    } catch (error) {
      console.error('Error deleting keys:', error);
      throw error;
    }
  }
}

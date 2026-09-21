import { NetworkInterfaceInfo } from '../types';

export const DEFAULT_INTERFACES: NetworkInterfaceInfo[] = [
  {
    name: 'wlan0',
    displayName: 'Wi-Fi 6 (802.11ax) Intel AX211',
    ipv4: '192.168.1.142',
    mac: '74:D0:2B:A4:91:E2',
    isLoopback: false,
    isUp: true,
    speedMb: 866,
    type: 'WIFI'
  },
  {
    name: 'eth0',
    displayName: 'Realtek PCIe GbE Gigabit Ethernet',
    ipv4: '10.0.0.55',
    mac: '00:E0:4C:68:01:A9',
    isLoopback: false,
    isUp: true,
    speedMb: 1000,
    type: 'ETHERNET'
  },
  {
    name: 'lo0',
    displayName: 'Software Loopback Interface 1',
    ipv4: '127.0.0.1',
    mac: '00:00:00:00:00:00',
    isLoopback: true,
    isUp: true,
    speedMb: 10000,
    type: 'LOOPBACK'
  }
];

/**
 * Builds the mobile endpoint URL based on current server settings.
 */
export function buildDownloadEndpoint(
  hostIp: string,
  port: number,
  token?: string
): string {
  const queryParam = token ? `?token=${encodeURIComponent(token)}` : '';
  return `http://${hostIp}:${port}/download/package.zip${queryParam}`;
}

/**
 * Returns a web-compatible mobile receiver URL that can also be accessed directly in the browser.
 */
export function buildWebMobilePreviewUrl(
  currentOrigin: string,
  sessionId: string,
  isBypass: boolean
): string {
  return `${currentOrigin}#mobile-receiver?session=${sessionId}&mode=${isBypass ? 'bypass' : 'watermark'}`;
}

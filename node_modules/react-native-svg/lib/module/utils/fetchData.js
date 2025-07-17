import { Platform } from 'react-native';
import { Buffer } from 'buffer';
export async function fetchText(uri) {
  if (!uri) {
    return null;
  }
  if (uri.startsWith('data:image/svg+xml;utf8') && Platform.OS === 'android') {
    return dataUriToXml(uri);
  } else if (uri.startsWith('data:image/svg+xml;base64')) {
    return decodeBase64Image(uri);
  } else {
    return fetchUriData(uri);
  }
}
const decodeBase64Image = uri => {
  const decoded = decodeURIComponent(uri);
  const splitContent = decoded.split(';')[1].split(',');
  const dataType = splitContent[0];
  const content = splitContent.slice(1).join(',');
  return Buffer.from(content, dataType).toString('utf-8');
};
function dataUriToXml(uri) {
  try {
    // decode and remove data:image/svg+xml;utf8, prefix
    return decodeURIComponent(uri).split(',').slice(1).join(',');
  } catch (error) {
    throw new Error(`Decoding ${uri} failed with error: ${error}`);
  }
}
async function fetchUriData(uri) {
  const response = await fetch(uri);
  if (response.ok || response.status === 0 && uri.startsWith('file://')) {
    return await response.text();
  }
  throw new Error(`Fetching ${uri} failed with status ${response.status}`);
}
//# sourceMappingURL=fetchData.js.map
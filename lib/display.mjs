// Keep untrusted prose inside a JSON code block, including in Markdown viewers.
export function dataBlock(value) {
  const data = JSON.stringify(value, null, 2).replace(/[`<>&]/g, character => '\\u' + character.charCodeAt(0).toString(16).padStart(4, '0'));
  return '```json\n' + data + '\n```\n';
}

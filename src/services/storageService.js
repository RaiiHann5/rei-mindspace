// Local mode: instead of uploading to Firebase Storage, the logo is
// read as a base64 data URL and stored directly on the business record.
// Fine for local development; swap for real Storage uploads before
// shipping (data URLs bloat localStorage and aren't ideal for prod).
export async function uploadBusinessLogo(_userId, file) {
  return uploadImage(_userId, file)
}

// Same local-mode approach as the logo upload above, used for the
// business's QRIS payment code image.
export async function uploadQrisImage(_userId, file) {
  return uploadImage(_userId, file)
}

function uploadImage(_userId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(file)
  })
}

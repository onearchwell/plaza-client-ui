
export default function UnauthorizedPage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Document Error</h1>
      <p className="mb-6">Either the file doesn't exist or You don’t have permission to view this file directly. Please try with a valid File ID</p>
    </div>
  )
}

import type { Access, FieldAccess } from 'payload'

// Roles: admin (everything, incl. users and developer settings), editor (all
// content), sales (can only change units). Content is public to read: the site
// build pulls it without credentials.

type Role = 'admin' | 'editor' | 'sales'

const hasRole = (user: unknown, ...roles: Role[]) =>
  Boolean(user && roles.includes((user as { role?: Role }).role as Role))

export const anyone: Access = () => true
export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const admins: Access = ({ req }) => hasRole(req.user, 'admin')
export const editors: Access = ({ req }) => hasRole(req.user, 'admin', 'editor')
export const sales: Access = ({ req }) => hasRole(req.user, 'admin', 'editor', 'sales')

export const loggedInField: FieldAccess = ({ req }) => Boolean(req.user)
export const adminsField: FieldAccess = ({ req }) => hasRole(req.user, 'admin')
export const editorsField: FieldAccess = ({ req }) => hasRole(req.user, 'admin', 'editor')

// Slugs are in URLs: set once, then only an admin can change them.
export const slugUpdate: FieldAccess = ({ req, doc }) => !doc?.slug || hasRole(req.user, 'admin')

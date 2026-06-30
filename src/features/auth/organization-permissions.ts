import {
  createAccessControl,
  type Statements,
} from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from 'better-auth/plugins/organization/access';

const customStatements = {
  commute: ['read', 'create', 'update', 'delete'],
  booking: ['read', 'manage', 'request'],
  location: ['read', 'create', 'update', 'delete'],
  commuteTemplate: ['read', 'create', 'update', 'delete'],
} satisfies Statements;

// Reserved for managers and above (admin + owner), not regular members.
const managerStatements = {
  stats: ['read'],
} satisfies Statements;

const ownerOnlyStatements = {
  orgNotificationChannel: ['manage'],
} satisfies Statements;

const organizationStatements = {
  ...defaultStatements,
  member: [...defaultStatements.member, 'read'],
  invitation: [...defaultStatements.invitation, 'read'],
  ...customStatements,
  ...managerStatements,
  ...ownerOnlyStatements,
};

const ac = createAccessControl(organizationStatements);

const roleMember = ac.newRole({
  ...memberAc.statements,
  invitation: [],
  member: [],
  organization: [],
  ...customStatements,
});

const roleAdmin = ac.newRole({
  ...adminAc.statements,
  member: [...adminAc.statements.member, 'read'],
  invitation: [...adminAc.statements.invitation, 'read'],
  ...customStatements,
  ...managerStatements,
});

const roleOwner = ac.newRole({
  ...ownerAc.statements,
  member: [...ownerAc.statements.member, 'read'],
  invitation: [...ownerAc.statements.invitation, 'read'],
  ...customStatements,
  ...managerStatements,
  ...ownerOnlyStatements,
});

const roles = { owner: roleOwner, admin: roleAdmin, member: roleMember };

export const organizationPermissions = { ac, roles };

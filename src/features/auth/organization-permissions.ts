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
  booking: ['read', 'create', 'manage', 'request'],
  location: ['read', 'create', 'update', 'delete'],
  commuteTemplate: ['read', 'create', 'update', 'delete'],
} satisfies Statements;

const ownerOnlyStatements = {
  orgNotificationChannel: ['manage'],
} satisfies Statements;

const organizationStatements = {
  ...defaultStatements,
  ...customStatements,
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
  ...customStatements,
});

const roleOwner = ac.newRole({
  ...ownerAc.statements,
  ...customStatements,
  ...ownerOnlyStatements,
});

const roles = { owner: roleOwner, admin: roleAdmin, member: roleMember };

export const organizationPermissions = { ac, roles };

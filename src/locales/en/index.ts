import 'dayjs/locale/en.js';

import account from './account.json' with { type: 'json' };
import auth from './auth.json' with { type: 'json' };
import booking from './booking.json' with { type: 'json' };
import buildInfo from './build-info.json' with { type: 'json' };
import common from './common.json' with { type: 'json' };
import commute from './commute.json' with { type: 'json' };
import commuteRequest from './commute-request.json' with { type: 'json' };
import commuteTemplate from './commute-template.json' with { type: 'json' };
import components from './components.json' with { type: 'json' };
import dashboard from './dashboard.json' with { type: 'json' };
import emails from './emails.json' with { type: 'json' };
import landing from './landing.json' with { type: 'json' };
import layout from './layout.json' with { type: 'json' };
import location from './location.json' with { type: 'json' };
import notifications from './notifications.json' with { type: 'json' };
import organization from './organization.json' with { type: 'json' };
import stats from './stats.json' with { type: 'json' };
import user from './user.json' with { type: 'json' };

export default {
  account,
  auth,
  booking,
  buildInfo,
  commute,
  commuteRequest,
  commuteTemplate,
  common,
  components,
  dashboard,
  emails,
  landing,
  layout,
  location,
  notifications,
  organization,
  stats,
  user,
} as const;

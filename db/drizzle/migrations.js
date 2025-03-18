// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_fair_cerebro.sql';
import m0001 from './0001_cloudy_praxagora.sql';
import m0002 from './0002_tearful_alex_power.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002
    }
  }
  
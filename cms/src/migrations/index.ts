import * as migration_20260929_040154_initial from './20260929_040154_initial';

export const migrations = [
  {
    up: migration_20260929_040154_initial.up,
    down: migration_20260929_040154_initial.down,
    name: '20260929_040154_initial'
  },
];

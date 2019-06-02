'use strict';

const Monit = require(`./Monit`);


(async () => {
  const monit = new Monit();
  await monit.main();
})();

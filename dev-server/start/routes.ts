/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const IdentitiesController = () => import("#controllers/identities_controller")
const ProxyController = () => import('#controllers/proxy_controller')

router.get('/', async () => 'GalaChain Dev Server')

router.get('/identities/health', [IdentitiesController, 'health'])
router.get('/identities/config', [IdentitiesController, 'config'])
router.get('/identities/new-random-user', [IdentitiesController, 'registerRandomEthUser'])

router.post('/identities/CreateHeadlessWallet', [IdentitiesController, 'registerEthUser'])

router.post(`/api/:channel/:contract/:method`, [ProxyController, 'proxy'])
const fs = require('fs');
const p = 'frontend/src/pages/DashboardPage.tsx';
let code = fs.readFileSync(p, 'utf8');

if (!code.includes('import { useEffect }')) {
  code = code.replace("import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'", "import { useEffect } from 'react'\nimport { Routes, Route, NavLink, useNavigate } from 'react-router-dom'");
}
if (!code.includes('import { negociosApi }')) {
  code = code.replace("import { authApi } from '../api/auth'", "import { authApi } from '../api/auth'\nimport { negociosApi } from '../api/negocios'");
}

const target = "  const { logout, hasPermission } = usePanelStore()\r\n  const canManageBilling = hasPermission('facturacion:gestionar')";
const targetUnix = "  const { logout, hasPermission } = usePanelStore()\n  const canManageBilling = hasPermission('facturacion:gestionar')";

const injection = \  const { logout, hasPermission } = usePanelStore()
  const canManageBilling = hasPermission('facturacion:gestionar')
  const negocio = useTenantStore((s) => s.negocio)
  const setNegocio = useTenantStore((s) => s.setNegocio)

  useEffect(() => {
    if (!negocio) {
      negociosApi.getActual()
        .then(res => setNegocio(res.data.data))
        .catch(err => console.error('Error fetching tenant', err))
    }
  }, [negocio, setNegocio])\;

code = code.replace(target, injection);
code = code.replace(targetUnix, injection);
fs.writeFileSync(p, code, 'utf8');

/**
 * Config IPC handlers
 * Bridges renderer ↔ ConfigService via Electron IPC
 */

const { ipcMain } = require('electron');

/**
 * Register all config-related IPC handlers
 * @param {import('../services/ConfigService').ConfigService} configService
 */
function registerConfigIPC(configService) {
  ipcMain.handle('config-get-schema', () => {
    return configService.schema;
  });

  ipcMain.handle('config-get-global', () => {
    return configService.getGlobal();
  });

  ipcMain.handle('config-set-global', (_event, values) => {
    configService.setGlobalAll(values);
  });

  ipcMain.handle('config-get-project', (_event, projectPath) => {
    return configService.getProject(projectPath);
  });

  ipcMain.handle('config-set-project', (_event, { projectPath, values }) => {
    configService.setProjectAll(projectPath, values);
  });

  ipcMain.handle('config-resolve', (_event, { key, projectPath }) => {
    return configService.resolve(key, projectPath);
  });

  ipcMain.handle('config-resolve-all', (_event, projectPath) => {
    return configService.resolveAll(projectPath);
  });
}

module.exports = { registerConfigIPC };

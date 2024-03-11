import { stat } from 'node:fs/promises'
/**
 * @param {string} filePath
 * @noexcept
 */
export const isFile = async (filePath) =>
    await stat(filePath)
        .then((stat) => stat.isFile())
        .catch((_) => false)

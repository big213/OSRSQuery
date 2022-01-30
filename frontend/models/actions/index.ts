import { handleError } from '~/services/base'
import { executeGiraffeql } from '~/services/giraffeql'

export const refreshDiscordOutput = async (that, item) => {
  try {
    that.$notifier.showSnackbar({
      message: 'Refreshing Discord Output',
      variant: 'info',
    })

    await executeGiraffeql(that, {
      refreshDiscordChannel: {
        __args: {
          id: item.id,
        },
      },
    })

    that.$notifier.showSnackbar({
      message: 'Done Refreshing',
      variant: 'success',
    })
  } catch (err) {
    handleError(that, err)
  }
}

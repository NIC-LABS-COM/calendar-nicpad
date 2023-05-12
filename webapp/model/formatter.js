sap.ui.define([], function () {
  'use strict'

  return {
    /**
     * Converts the timestamp back to date
     * @public
     * @param {string} sDateTimeUTC a date in UTC string format
     * @returns {object} new date object created from sDateTimeUTC string
     */
    utcToLocalDateTime: function (sDateTimeUTC) {
      if (!sDateTimeUTC) {
        return null
      }

      // Converte a string em um objeto Date
      var oDate = new Date(Date.parse(sDateTimeUTC))

      // Obtém o valor numérico da data em milissegundos
      var iMillisUTC = oDate.getTime()

      // Cria um novo objeto Date a partir do valor numérico
      var oLocalDate = new Date(iMillisUTC)

      // Formata a data de acordo com o formato desejado
      var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
        pattern: 'dd/MM/yyyy HH:mm:ss'
      })
      var sFormattedDate = oDateFormat.format(oLocalDate)

      return sFormattedDate
    }
    /**
     * Adds proper path prefix to the image URL (in the model the images are
     * stored with their relative path to the application); if the image is
     * an icon, the formatting is skipped
     * @public
     * @param {string} sImage an image URL
     * @returns {string} prefixed image URL (if necessary)
     */
    // fixImagePath: function (sImage) {
    //   if (sImage && sImage.substr(0, 11) !== 'sap-icon://') {
    //     sImage = this.imagePath + sImage
    //   }
    //   return sImage
    // }
  }
})

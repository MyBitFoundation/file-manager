module.exports = byteSize

class ByteSize {
  constructor (bytes, options) {
    options = options || {}
    options.units = options.units || 'metric'
    options.precision = typeof options.precision === 'undefined' ? 1 : options.precision

    const table = [
      { expFrom: 0, expTo: 1, metric: 'B', iec: 'B', metric_octet: 'o', iec_octet: 'o' },
      { expFrom: 1, expTo: 2, metric: 'kB', iec: 'KiB', metric_octet: 'ko', iec_octet: 'Kio' },
      { expFrom: 2, expTo: 3, metric: 'MB', iec: 'MiB', metric_octet: 'Mo', iec_octet: 'Mio' },
      { expFrom: 3, expTo: 4, metric: 'GB', iec: 'GiB', metric_octet: 'Go', iec_octet: 'Gio' },
      { expFrom: 4, expTo: 5, metric: 'TB', iec: 'TiB', metric_octet: 'To', iec_octet: 'Tio' },
      { expFrom: 5, expTo: 6, metric: 'PB', iec: 'PiB', metric_octet: 'Po', iec_octet: 'Pio' },
      { expFrom: 6, expTo: 7, metric: 'EB', iec: 'EiB', metric_octet: 'Eo', iec_octet: 'Eio' },
      { expFrom: 7, expTo: 8, metric: 'ZB', iec: 'ZiB', metric_octet: 'Zo', iec_octet: 'Zio' },
      { expFrom: 8, expTo: 9, metric: 'YB', iec: 'YiB', metric_octet: 'Yo', iec_octet: 'Yio' }
    ]

    const base = options.units === 'metric' || options.units === 'metric_octet' ? 1000 : 1024

    for (let i = 0; i < table.length; i++) {
      const lower = Math.pow(base, table[i].expFrom)
      const upper = Math.pow(base, table[i].expTo)
      if (bytes >= lower && bytes < upper) {
        const units = table[i][options.units]
        if (i === 0) {
          this.value = String(bytes)
          this.unit = units
          return
        } else {
          this.value = (bytes / lower).toFixed(options.precision)
          this.unit = units
          return
        }
      }
    }

    this.value = String(bytes)
    this.unit = ''
  }

  toString () {
    return `${this.value} ${this.unit}`.trim()
  }
}

function byteSize (bytes, options) {
  return new ByteSize(bytes, options)
}

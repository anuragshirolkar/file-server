
function beautifySize(size) {
    if (size < 1024) {
        return size.toFixed(1) + 'B'
    }
    if (size < 1024*1024) {
        return (size / 1024).toFixed(1) + 'K'
    }
    return (size / 1024 / 1024).toFixed(1) + 'M'
}

exports.beautifySize = beautifySize
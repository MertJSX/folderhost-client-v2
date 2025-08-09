const convertToBytes = function (sizeString) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    // Split the input into numerical value and unit
    const [value, unit] = sizeString.split(" ");

    // Find the index of the unit in the sizes array
    const index = sizes.indexOf(unit);

    // If unit is not found or value is not a number, return NaN
    if (index === -1 || isNaN(value)) {
        return 0;
    }

    // Calculate the bytes
    return parseFloat(value) * Math.pow(1024, index);
}

export default convertToBytes;
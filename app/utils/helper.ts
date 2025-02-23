export const currentTimeCzechia = () => {
    const now = new Date();
    const formattedTime = new Intl.DateTimeFormat("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Use 24-hour format
    }).format(now);
    console.log(formattedTime);
    return formattedTime;
};

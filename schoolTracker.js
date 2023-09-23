// Developed by article_012

const readline = require("readline");
const fetch = require("cross-fetch");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구/평균 반지름
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

const dataset = require("./전국초중등학교위치표준데이터.json")["records"];

const findClosestSchool = (latitude, longitude, classification) => {
    let closestLocation = null;
    let closestDistance = Number.MAX_VALUE;

    for(const schoolInfo of dataset) {
        if (schoolInfo["학교급구분"] === classification) {
            const distance = haversine(latitude, longitude, schoolInfo["위도"], schoolInfo["경도"]);
            if (distance < closestDistance) {
                closestLocation = schoolInfo;
                closestDistance = distance;
            }
        }
    }

    return closestLocation;
};

(async () => {
    console.log(`Developed by Discord:article_012\n`)

    const ip = await new Promise((resolve) => rl.question('target ip: ', resolve));
    const koreanAge = await new Promise((resolve) => rl.question('traditional Korean age: ', resolve));
    let classification;

    const res = await (await fetch(`http://ip-api.com/json/${ip}`)).json();
    
    if(res["status"] == "fail") {
        return console.log(`Fail: ${res["message"]}`);
    }

    if (koreanAge > 19) {
        return console.log("Fail: That age is the age at which the school cannot be guessed 1");
    } else if (koreanAge > 16) {
        classification = "고등학교";
    } else if (koreanAge > 13) {
        classification = "중학교";
    } else if (koreanAge > 7) {
        classification = "초등학교";
    } else {
        return console.log("Fail: That age is the age at which the school cannot be guessed 2");
    }

    const targetLatitude = res["lat"];
    const targetLongitude = res["lon"];

    console.log(`ip location: ${targetLatitude}, ${targetLongitude}`)
    
    const closestLocation = findClosestSchool(targetLatitude, targetLongitude, classification);
    console.log('Closest School:', closestLocation);
})();

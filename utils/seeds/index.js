const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../../models/campground');

// Connect to MongoDB
async function mongoConnect() {

    await mongoose.connect('mongodb://localhost:2717/CampgroundAdvisor');
    console.log('Connection to MongoDB open');

}
mongoConnect().catch((err) => console.log('Caught an error:', err))

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dkp8n2k8q/image/upload/v1662787726/CampingAdvisor/wtyhnxunauvmlnsbjgup.jpg',
                    filename: 'CampingAdvisor/wtyhnxunauvmlnsbjgup'
                },
                {
                    url: 'https://res.cloudinary.com/dkp8n2k8q/image/upload/v1662787727/CampingAdvisor/hyick8i44vhq5bzpsvgz.jpg',
                    filename: 'CampingAdvisor/hyick8i44vhq5bzpsvgz'
                },
                {
                    url: 'https://res.cloudinary.com/dkp8n2k8q/image/upload/v1662787728/CampingAdvisor/xvcqnegwvv8dqqmjkm8g.jpg',
                    filename: 'CampingAdvisor/xvcqnegwvv8dqqmjkm8g'
                },
            ],
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nesciunt ipsum, dolorum enim aspernatur in iusto. Vitae veritatis est labore distinctio quisquam fugit adipisci ipsa ipsam, ex reiciendis unde quaerat quam.',
            price: Math.floor(Math.random() * 50) + 10,
            author: '631ae88dd61abfee0c0c8d9c',
            geometry: {
                type: 'Point',
                coordinates: [23.90 + (Math.random() * 4) * (Math.random() < 0.5 ? -1 : 1), 54.90 + (Math.random() * 4) * (Math.random() < 0.5 ? -1 : 1)]
            }
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})


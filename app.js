import express from 'express';
import {Agent, createServer} from 'node:http'
import axios from 'axios'

const app = express();
const hostname = '127.0.0.1'
const port = 5000;
const url = 'https://api.app.studiospace.com/listings/list-agencies?skip=12'
process.env.TZ = 'Asia/Manila'


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

async function init() {
    await getReports()
}
init();


async function getReports(){
    try {
        const locations = ["AU", "GB", "US"]
        const services = ["Advertising, Brand & Creative", "Media, PR & Events"]
        let _sameLocations = []
        let _otherLocations = []
        let _sameServices = []
        let agencies = await axios.get(url)
        let data = agencies.data[0]
        let _totalAgencies = agencies.data[1]
        
        data.forEach(dt => {
            dt.locations.forEach(loc => {
                if(locations.includes(loc.country.code)) _sameLocations.push(dt)
                else _otherLocations.push(dt)
            })
        })
        _sameLocations.forEach(s => {
            s.agencyService.forEach(as => {
                
                if(services.includes(as.service.serviceGroup.name) && _sameServices.length === 0) _sameServices.push(s)
                else if(_sameServices){
                    let _companies = _sameServices.flatMap(service => service.companyName)
                    if(!_companies.includes(s.companyName))_sameServices.push(s)
                    _companies = []
                }
            })
        })

        console.log("services :>> ", JSON.parse(JSON.stringify(_sameServices)))
        
        let result = {
            totalAgencies: _totalAgencies,
            sameLocations: _sameLocations,
            totalSameLocations: _sameLocations.length,
            sameServices: _sameServices,
            totalSameServices: _sameServices.length,
            others: _otherLocations,
            totalOtherAgencies: _otherLocations.length
        }
        console.log("totalAgencies :>>> ",JSON.parse(JSON.stringify(result)))
    } catch (error) {
        console.log("Error :>> ", error)
    }
}

const server = createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain');
})

server.listen(port, hostname, () => {
    console.log(`started at port: ${port}`)
})



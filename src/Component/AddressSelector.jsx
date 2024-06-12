import React, { Component } from 'react';
import data from '../UrlRouter/ConnectJSON/data.json'; // Import data from JSON file
class AddressSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            provinces: [],
            districts: [],
            wards: [],
            selectedProvince: '-1',
            selectedDistrict: '-1',
            selectedWard: '-1'
        };
    }

    componentDidMount() {

        this.setState({ provinces: data });
    }

    handleProvinceChange = (event) => {
        const selectedProvince = event.target.value;
        const selectedDistrict = '-1';
        const selectedWard = '-1';

        this.setState({ selectedProvince, selectedDistrict, selectedWard });
        // Find districts of the selected province
        // const districts = data.find(province => province.code === parseInt(selectedProvince))?.districts || [];
        // console.log(districts, 'districts-change');
        // this.setState({ districts }); // Cập nhật districts ở đây
    }


    handleDistrictChange = (event) => {
        const selectedDistrict = event.target.value;
        const selectedWard = '-1';

        this.setState({ selectedDistrict, selectedWard });

        // Find wards of the selected district
        const selectedProvince = this.state.selectedProvince;
        const wards = data
            .find(province => province.code === parseInt(selectedProvince))
            ?.districts.find(district => district.code === parseInt(selectedDistrict))?.wards || [];
        this.setState({ wards });
    }

    handleWardChange = (event) => {
        const selectedWard = event.target.value;
        this.setState({ selectedWard });
    }

    render() {
        const { provinces, districts, wards, selectedProvince, selectedDistrict, selectedWard } = this.state;
      
        return (
            <div>
                <select value={selectedProvince} onChange={this.handleProvinceChange}>
                    <option value="-1">Chọn tỉnh/thành phố</option>
                    {provinces.map(province => (
                        <option key={province.code} value={province.code}>{province.name}</option>
                    ))}
                </select>
                {/* <select value={selectedDistrict} onChange={this.handleDistrictChange}>
                    <option value="-1">Chọn quận/huyện</option>
                    {districts.map(district => (
                        <option key={district.code} value={district.code}>{district.name}</option>
                    ))}
                </select>
                <select value={selectedWard} onChange={this.handleWardChange}>
                    <option value="-1">Chọn phường/xã</option>
                    {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                    ))}
                </select> */}
            </div>
        );
    }
}

export default AddressSelector;

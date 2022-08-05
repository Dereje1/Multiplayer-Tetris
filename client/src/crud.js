import axios from 'axios';

const RESTcall = async ({ address, method = 'get', payload = null }) => {
    try {
        const { data } = await axios[method](address, payload);
        return data;
    } catch (error) {
        throw (error);
    }
};

export default RESTcall;
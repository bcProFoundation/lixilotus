import { City, Country, State } from '@bcpros/lixi-models';
import axiosClient from '@utils/axiosClient';

const countryApi = {
  getCountries(): Promise<Country> {
    const url = `/api/countries`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as Country;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  getStates(id: number | string): Promise<State> {
    const url = `/api/countries/${id}/states`;
    return axiosClient
      .get(url)
      .then(response => {
        return response.data as State;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  },
  // getCities(): Promise<City> {
  //   const url = `/api/countries/cities`;
  //   return axiosClient
  //     .get(url)
  //     .then(response => {
  //       return response.data as City;
  //     })
  //     .catch(err => {
  //       const { response } = err;
  //       throw response?.data ?? err ?? 'Network Error';
  //     });
  // },
};

export default countryApi;

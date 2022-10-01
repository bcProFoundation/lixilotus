import React from 'react';
import { GetServerSideProps } from 'next';
import Lixi from '@components/Lixi';
import axiosClient from '@utils/axiosClient';
import { LixiDto } from '@bcpros/lixi-models';

const LixiPage = ({ lixi }) => {
  return <Lixi lixi={lixi} />;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
  const { id } = params;
  const url = `/api/lixies/${id}/no-secret`;
  let lixi = {};
  if (id) {
    lixi = await axiosClient
      .get(url)
      .then(response => {
        return response.data as LixiDto;
      })
      .catch(err => {
        const { response } = err;
        throw response?.data ?? err ?? 'Network Error';
      });
  }

  return {
    props: {
      lixi
    }
  };
};

export default LixiPage;

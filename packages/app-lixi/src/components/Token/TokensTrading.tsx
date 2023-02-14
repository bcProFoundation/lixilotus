import { Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import React from 'react';
import styled from 'styled-components';

interface DataType {
  key: string;
  name: string;
  ticker: string;
  burn: number;
  comments: string;
  created: string;
  tags: string[];
}

const StyledTokensListing = styled.div`
  .title-page {
    text-align: left;
  }
`;

const TokensTrading: React.FC = () => {
  const columns: ColumnsType<any> = [
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      render: (_, record) => (
        <span>
          {record.quantity} <a>{record.token}</a>
        </span>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price'
    },
    {
      title: 'Price per Token',
      dataIndex: 'perToken',
      key: 'perToken'
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'seller'
    },
    // {
    //   title: 'Tags',
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   render: (_, { tags }) => (
    //     <>
    //       {tags.map(tag => {
    //         let color = tag.length > 5 ? 'geekblue' : 'green';
    //         if (tag === 'loser') {
    //           color = 'volcano';
    //         }
    //         return (
    //           <Tag color={color} key={tag}>
    //             {tag.toUpperCase()}
    //           </Tag>
    //         );
    //       })}
    //     </>
    //   )
    // },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>Buy</a>
        </Space>
      )
    }
  ];

  const data: any[] = [
    {
      key: '1',
      token: 'HONK',
      name: 'HONK HONK',
      quantity: 5.241,
      price: 10.0,
      perToken: 2,
      seller: 'ericson'
    },
    {
      key: '2',
      token: 'HONK',
      name: 'HONK HONK',
      quantity: 98.241,
      price: 102.0,
      perToken: 2,
      seller: 'vin8x'
    },
    {
      key: '3',
      token: 'HONK',
      name: 'HONK HONK',
      quantity: 81.241,
      price: 70.0,
      perToken: 2,
      seller: 'ken'
    },
    {
      key: '4',
      token: 'HONK',
      name: 'HONK HONK',
      quantity: 15.241,
      price: 60.0,
      perToken: 2,
      seller: 'takyoon'
    }
  ];

  return (
    <StyledTokensListing>
      <h2 className="title-page">Trading table</h2>
      <Table columns={columns} dataSource={data} />
    </StyledTokensListing>
  );
};

export default TokensTrading;

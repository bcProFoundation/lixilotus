import { CopyOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { isMobile } from 'react-device-detect';
import intl from 'react-intl-universal';
import { TableVirtuoso } from 'react-virtuoso';
import styled from 'styled-components';

const StyledTable = styled.div`
  height: 35vh;
  margin-bottom: 5px;

  .sub-lixi {
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    width: 100%;
    border-collapse: collapse;
  }
`;

const StyledTableHead = styled.th`
  border-bottom: 1px solid #e0e0e0;
  padding: 10px;
`;

const StyledTableData = styled.td`
  border-bottom: 1px solid #e0e0e0;
  padding: 18px;
  width: 2%;
  display: table-cell;
  background: white;
`;

const SubLixiList = props => {
  const { dataSource, columns, loadMore } = props;
  const prefixClaimCode = 'lixi';

  const handleOnCopyClaimCode = () => {
    message.info(intl.get('claim.claimCodeCopied'));
  };

  const subLixiesDataSource =
    dataSource &&
    dataSource.map((item, i) => {
      return {
        num: i + 1,
        claimCode: (
          <CopyToClipboard text={`${prefixClaimCode}_${item.claimCode}`} onCopy={handleOnCopyClaimCode}>
            <span>
              {isMobile ? (
                <>{`${item.claimCode}`}</>
              ) : (
                <div style={{ cursor: 'pointer' }}>
                  {`${prefixClaimCode}_${item.claimCode}`} <CopyOutlined />
                </div>
              )}
            </span>
          </CopyToClipboard>
        ),
        amount: parseFloat(item.amount).toFixed(2),
        isClaimed: item.isClaimed ? (
          <span
            style={{
              color: '#FFFFFF',
              padding: '4px 8px',
              borderRadius: '8px',
              fontWeight: '400',
              fontSize: '14px',
              background: '#598300'
            }}
          >
            Redeemed
          </span>
        ) : (
          <span
            style={{
              color: '#FFFFFF',
              padding: '4px 8px',
              borderRadius: '8px',
              fontWeight: '400',
              fontSize: '14px',
              background: '#E37100'
            }}
          >
            Remaining
          </span>
        )
      };
    });

  return (
    <StyledTable>
      <TableVirtuoso
        className="sub-lixi"
        style={{ height: '100%', borderCollapse: 'separate' }}
        data={subLixiesDataSource}
        overscan={200}
        endReached={loadMore}
        components={{
          Table: ({ style, ...props }) => (
            <table {...props} style={{ ...style, borderCollapse: 'separate', width: '100%' }} />
          )
        }}
        fixedHeaderContent={() => (
          <tr>
            {columns.map(column => {
              return (
                <StyledTableHead key={column.dataIndex} style={{ background: 'white', tableLayout: 'fixed' }}>
                  {column.title}
                </StyledTableHead>
              );
            })}
          </tr>
        )}
        itemContent={(index, item) => {
          return (
            <>
              <StyledTableData>{item.num}</StyledTableData>
              <StyledTableData>{item.claimCode}</StyledTableData>
              <StyledTableData>{item.amount}</StyledTableData>
              <StyledTableData>{item.isClaimed}</StyledTableData>
            </>
          );
        }}
        totalCount={dataSource.length}
      />
    </StyledTable>
  );
};

export default SubLixiList;

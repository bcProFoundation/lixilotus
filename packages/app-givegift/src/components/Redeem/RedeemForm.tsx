import { Collapse, Form, Input, Modal, notification } from 'antd';
import { RedeemCollapse } from '@abcpros/givegift-components/components/Common';


const { Panel } = Collapse;

const RedeemForm = () => {

  return (
    <>
      <RedeemCollapse
        style={{
          marginBottom: '24px',
        }}
      >
        <Panel header="Redeem token" key="1">
        </Panel>
      </RedeemCollapse>
    </>
  )
}

export default RedeemForm;
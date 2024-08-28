import { Skeleton, Space } from "antd-mobile"

export const LoaderTitle = () =>
  <Skeleton animated style={{ height: '19px', width: '150px' }} />
export const Loader = () => <>
  <br />
  <div
    style={{
      margin: '0 0.5rem',
      width: 'calc(100% - 1rem)',
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'scroll',
      overflowY: 'hidden',
    }}
  >
    <Space
      style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
      direction="vertical"
      justify="center"
      align="center"
    >
      <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
      {/* <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
      <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} /> */}
    </Space>
    <Space
      style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
      direction="vertical"
      justify="center"
      align="center"
    >
      <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
      {/* <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
      <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} /> */}
    </Space>
    <Space
      style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
      direction="vertical"
      justify="center"
      align="center"
    >
      <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
      {/* <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
      <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} /> */}
    </Space>
    <Space
      style={{ '--gap': '3px', width: '33%', margin: '0 0.25rem' }}
      direction="vertical"
      justify="center"
      align="center"
    >
      <Skeleton animated style={{ width: '70px', height: '70px', borderRadius: '35px' }} />
      {/* <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '18px', width: '70px' }} />
      <Skeleton animated style={{ marginTop: '0.5rem', marginLeft: '0', height: '12px', width: '40px' }} /> */}
    </Space>
  </div>
</>